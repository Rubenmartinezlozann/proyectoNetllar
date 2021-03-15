<?php

namespace App\Repository;

use App\Entity\User;
use App\Entity\Token;
use App\Repository\TokenRepository;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @method User|null find($id, $lockMode = null, $lockVersion = null)
 * @method User|null findOneBy(array $criteria, array $orderBy = null)
 * @method User[]    findAll()
 * @method User[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserRepository extends ServiceEntityRepository implements PasswordUpgraderInterface
{
    public function __construct(ManagerRegistry $registry, UserPasswordEncoderInterface $passwordEncoder, EntityManagerInterface $manager, TokenRepository $tokenRepository)
    {
        parent::__construct($registry, User::class);
        $this->passwordEncoder = $passwordEncoder;
        $this->manager = $manager;
        $this->tokenRepository = $tokenRepository;
    }
    private $manager;
    private $tokenRepository;

    /**
     * Used to upgrade (rehash) the user's password automatically over time.
     */
    public function upgradePassword(UserInterface $user, string $newEncodedPassword): void
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', \get_class($user)));
        }

        $user->setPassword($newEncodedPassword);
        $this->manager->persist($user);
        $this->manager->flush();
    }

    public function saveUser($username, $password, $roles, $city, $phone_contact, $mail, $address)
    {
        $user = new User();

        $user->setUsername($username);
        $user->setPassword($this->passwordEncoder->encodePassword($user, $password));
        $user->setRoles($roles);
        $user->setCity($city);
        $user->setPhoneContact($phone_contact);
        $user->setMail($mail);
        $user->setAddress($address);

        $this->manager->persist($user);
        $this->manager->flush();
    }

    public function updateUser(User $user): User
    {
        $user->setPassword($this->passwordEncoder->encodePassword($user, $user->getPassword()));
        $this->manager->persist($user);
        $this->manager->flush();

        return $user;
    }

    public function removeUser(User $user)
    {
        $this->manager->remove($user);
        $this->manager->flush();
    }

    public function login(User $user)
    {
        $this->tokenRepository->addToken($user);
    }

    public function loginOk(User $user): bool
    {
        return $user->getToken() !== null
            ? ($user->getToken()->getExpiationDate() > date('Y-m-d H:i:s')
                ? true
                : ($this->logout($user)
                    ? false
                    : true))
            : false;
    }

    public function logout(User $user): bool
    {
        $token = null;
        $user->setToken($token);
        return $user->$this->tokenRepository->removeToken($user->getToken());
    }
}

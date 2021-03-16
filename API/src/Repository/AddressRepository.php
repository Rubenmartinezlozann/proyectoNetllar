<?php

namespace App\Repository;

use App\Entity\Address;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\Query\ResultSetMapping;
use Doctrine\ORM\EntityManagerInterface;

/**
 * @method Address|null find($id, $lockMode = null, $lockVersion = null)
 * @method Address|null findOneBy(array $criteria, array $orderBy = null)
 * @method Address[]    findAll()
 * @method Address[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class AddressRepository extends ServiceEntityRepository
{
    private $manager;

    public function __construct(ManagerRegistry $registry, EntityManagerInterface $manager)
    {
        parent::__construct($registry, City::class);
        $this->manager = $manager;
    }

    public function suggestAddress($text)
    {
        $address = $this->getWords($text);
    }

    private function getWords($text)
    {
        $substringStart = 0;
        $isStartSet = false;
        for ($i = 0; $i < strlen($text); $i++) {
            if ((substr($text, $i, 1) === ' ' || substr($text, $i, 1) === ',') && $isStartSet) {
                $address[] = substr($text, $substringStart, $i - $substringStart);
                $isStartSet = false;
                $substringStart = null;
            } elseif (substr($text, $i, 1) !== ' ' && substr($text, $i, 1) !== ',' && !$isStartSet) {
                $substringStart = $i;
                $isStartSet = true;
            }
        }
        $isStartSet ? $address[] = substr($text, $substringStart, strlen($text) - $substringStart) : true;

        return $address;
    }

    private function findIncompleteAdress($words = [])
    {
        $data = [];
        if (!empty($words)) {
            switch (count($words)) {
                case '1':
                    $data[] = $this->executeNativeQuery('SELECT PROVINCIA, MUNICIPIO, TIPOVIA, CALLE FROM direcciones WHERE CALLE like %?;', $words);
                    $data[] = $this->executeNativeQuery('SELECT PROVINCIA, MUNICIPIO, TIPOVIA, CALLE FROM direcciones WHERE PROVINCIA like %?;', $words);
                    $data[] = $this->executeNativeQuery('SELECT PROVINCIA, MUNICIPIO, TIPOVIA, CALLE FROM direcciones WHERE MUNICIPIO like %?;', $words);
                    $data[] = $this->executeNativeQuery('SELECT PROVINCIA, MUNICIPIO, TIPOVIA, CALLE FROM direcciones WHERE TIPOVIA like %?;', $words);
                    break;
                case '2':
                    $data[] = $this->executeNativeQuery('SELECT PROVINCIA, MUNICIPIO, TIPOVIA, CALLE FROM direcciones WHERE CALLE like %?;', $words);
                    $data[] = $this->executeNativeQuery('SELECT PROVINCIA, MUNICIPIO, TIPOVIA, CALLE FROM direcciones WHERE PROVINCIA like %?;', $words);
                    $data[] = $this->executeNativeQuery('SELECT PROVINCIA, MUNICIPIO, TIPOVIA, CALLE FROM direcciones WHERE MUNICIPIO like %?;', $words);
                    $data[] = $this->executeNativeQuery('SELECT PROVINCIA, MUNICIPIO, TIPOVIA, CALLE FROM direcciones WHERE TIPOVIA like %?;', $words);
                    break;
                default:
                    # code...
                    break;
            }
        }
        return $data;
    }

    private function executeNativeQuery($text, $params = [])
    {
        $rsm = new ResultSetMapping();
        $query = $this->manager->createNativeQuery($text, $rsm);
        for ($i = 0; $i < count($params); $i++) {
            $query->setParameter($i, $params = [$i]);
        }

        return $query->getResult();
    }

    /* return $this->createQueryBuilder('a')
            ->select('a.PROVINCIA, a.MUNICIPIO, a.TIPOVIA, a.CALLE')
            ->andWhere('a.PROVINCIA like %:prov')
            ->andWhere('a.MUNICIPIO like %:mun')
            ->andWhere('a.TIPOVIA like %:typ')
            ->andWhere('a.CALLE like %:street')
            ->setParameter('prov', $province)
            ->setParameter('mun', $municipality)
            ->setParameter('typ', $typeRoad)
            ->setParameter('street', $street)
            ->orderBy('a.Calle', 'ASC')
            ->setMaxResults(6)
            ->getQuery()
            ->getResult(); */

    /* public function findOneBySomeField($value): ?Address
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult();
    } */
}

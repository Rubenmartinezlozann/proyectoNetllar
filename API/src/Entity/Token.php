<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Token
 *
 * @ORM\Table(name="token", uniqueConstraints={@ORM\UniqueConstraint(name="UNIQ_5F37A13BA76ED395", columns={"user_id"})})
 * @ORM\Entity
 */
class Token
{
    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer", nullable=false)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="token", type="string", length=255, nullable=false)
     */
    private $token;

    /**
     * @var string|null
     *
     * @ORM\Column(name="login_date", type="string", length=255, nullable=true)
     */
    private $loginDate;

    /**
     * @var string|null
     *
     * @ORM\Column(name="expiation_date", type="string", length=255, nullable=true)
     */
    private $expiationDate;

    /**
     * @var \User
     *
     * @ORM\ManyToOne(targetEntity="User")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="user_id", referencedColumnName="id")
     * })
     */
    private $user;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function setToken(string $token): self
    {
        $this->token = $token;

        return $this;
    }

    public function getLoginDate(): ?string
    {
        return $this->loginDate;
    }

    public function setLoginDate(?string $loginDate): self
    {
        $this->loginDate = $loginDate;

        return $this;
    }

    public function getExpiationDate(): ?string
    {
        return $this->expiationDate;
    }

    public function setExpiationDate(?string $expiationDate): self
    {
        $this->expiationDate = $expiationDate;

        return $this;
    }

    public function getUser()
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;

        return $this;
    }


}

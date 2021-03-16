<?php

namespace App\Entity;

use App\Repository\AddressRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Address
 *
 * @ORM\Table(name="address")
 * @ORM\Entity
 * @ORM\Entity(repositoryClass=AddressRepository::class)
 */
class Address
{
    /**
     * @var int
     *
     * @ORM\Column(name="GESCAL17", type="bigint", nullable=false)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $gescal17;

    /**
     * @var bool|null
     *
     * @ORM\Column(name="UUII", type="boolean", nullable=true)
     */
    private $uuii;

    /**
     * @var string|null
     *
     * @ORM\Column(name="PRODUCTO", type="string", length=50, nullable=true)
     */
    private $producto;

    /**
     * @var string|null
     *
     * @ORM\Column(name="DESCRIPCION", type="string", length=50, nullable=true)
     */
    private $descripcion;

    /**
     * @var string|null
     *
     * @ORM\Column(name="PROVINCIA", type="string", length=50, nullable=true)
     */
    private $provincia;

    /**
     * @var string|null
     *
     * @ORM\Column(name="MUNICIPIO", type="string", length=50, nullable=true)
     */
    private $municipio;

    /**
     * @var int|null
     *
     * @ORM\Column(name="CP", type="integer", nullable=true)
     */
    private $cp;

    /**
     * @var string|null
     *
     * @ORM\Column(name="TIPOVIA", type="string", length=50, nullable=true)
     */
    private $tipovia;

    /**
     * @var string|null
     *
     * @ORM\Column(name="CALLE", type="string", length=50, nullable=true)
     */
    private $calle;

    /**
     * @var int|null
     *
     * @ORM\Column(name="NUMERO", type="integer", nullable=true)
     */
    private $numero;

    /**
     * @var string|null
     *
     * @ORM\Column(name="PPAI_CERRADO", type="string", length=50, nullable=true)
     */
    private $ppaiCerrado;

    /**
     * @var string|null
     *
     * @ORM\Column(name="SOLAPE", type="string", length=50, nullable=true)
     */
    private $solape;

    public function getGescal17(): ?string
    {
        return $this->gescal17;
    }

    public function getUuii(): ?bool
    {
        return $this->uuii;
    }

    public function setUuii(?bool $uuii): self
    {
        $this->uuii = $uuii;

        return $this;
    }

    public function getProducto(): ?string
    {
        return $this->producto;
    }

    public function setProducto(?string $producto): self
    {
        $this->producto = $producto;

        return $this;
    }

    public function getDescripcion(): ?string
    {
        return $this->descripcion;
    }

    public function setDescripcion(?string $descripcion): self
    {
        $this->descripcion = $descripcion;

        return $this;
    }

    public function getProvincia(): ?string
    {
        return $this->provincia;
    }

    public function setProvincia(?string $provincia): self
    {
        $this->provincia = $provincia;

        return $this;
    }

    public function getMunicipio(): ?string
    {
        return $this->municipio;
    }

    public function setMunicipio(?string $municipio): self
    {
        $this->municipio = $municipio;

        return $this;
    }

    public function getCp(): ?int
    {
        return $this->cp;
    }

    public function setCp(?int $cp): self
    {
        $this->cp = $cp;

        return $this;
    }

    public function getTipovia(): ?string
    {
        return $this->tipovia;
    }

    public function setTipovia(?string $tipovia): self
    {
        $this->tipovia = $tipovia;

        return $this;
    }

    public function getCalle(): ?string
    {
        return $this->calle;
    }

    public function setCalle(?string $calle): self
    {
        $this->calle = $calle;

        return $this;
    }

    public function getNumero(): ?int
    {
        return $this->numero;
    }

    public function setNumero(?int $numero): self
    {
        $this->numero = $numero;

        return $this;
    }

    public function getPpaiCerrado(): ?string
    {
        return $this->ppaiCerrado;
    }

    public function setPpaiCerrado(?string $ppaiCerrado): self
    {
        $this->ppaiCerrado = $ppaiCerrado;

        return $this;
    }

    public function getSolape(): ?string
    {
        return $this->solape;
    }

    public function setSolape(?string $solape): self
    {
        $this->solape = $solape;

        return $this;
    }
}
